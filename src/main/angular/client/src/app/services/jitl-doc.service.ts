import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Observable, forkJoin, of} from 'rxjs';
import {catchError, finalize, map, shareReplay, switchMap} from 'rxjs/operators';
import {MarkdownParserService} from './markdown-parser.service';
import {HelpRenderResult} from './help.service';
import {AuthService} from '../components/guard';

export interface JitlJob {
  name: string;
  class?: string;
}

/**
 * Renders the JITL job documentation from the server (./api/jitl-jobdoc) into the same result shape as help pages,
 * so that it can be shown by the HelpViewerComponent.
 *
 * Files are found by the job name (assignReference of the API inventory/wizard/jobs):
 *   <name>.json         metadata of the job, its arguments and return variables ("$ref" for shared parts)
 *   <lang>/<name>.md    text of the job ("[](include:...)" for shared parts), falls back to en/
 * When both files are missing, null is returned and the viewer shows its usual error, as for a missing help page.
 */
@Injectable({providedIn: 'root'})
export class JitlDocService {
  /** Served by the JOC server like the help files (./api/help-files), requires the access token. */
  private readonly basePath = './api/jitl-jobdoc';
  /** docPath of the APIs inventory/wizard/jobs|job: "/jitl-jobdoc/<name>.md" (former "sos/jitl-jobs/<name>.md", "/sos/jitl-jobs/<name>.xml"). */
  private readonly jitlDocFolder = /^\/?(?:sos\/jitl-jobs|jitl-jobdoc)\/([^/.]+)(\.(md|xml))?$/i;
  /** docName of the APIs: "<name>.md" (former "<name>.xml"). */
  private readonly jitlDocName = /^([^/.]+)\.(md|xml)$/i;
  private readonly maxIncludeDepth = 6;
  /** Lower-case job name -> job, filled from the API inventory/wizard/jobs. */
  private readonly jobs = new Map<string, JitlJob>();
  /** True once a response of inventory/wizard/jobs was stored (also when it was empty). */
  private jobsLoaded = false;
  /** Running request of loadJobs(), shared by all callers until it completes. */
  private jobsRequest$: Observable<boolean> | null = null;
  private readonly fileCache = new Map<string, Observable<string | null>>();

  constructor(
    private readonly http: HttpClient,
    private readonly md: MarkdownParserService,
    private readonly translate: TranslateService,
    private readonly authService: AuthService,
  ) {
  }

  /** Stores the JITL jobs of the API inventory/wizard/jobs (called by the Job Wizard with its response). */
  setJobs(jobs: any[]): void {
    if (!Array.isArray(jobs)) {
      return;
    }
    for (const job of jobs) {
      const name = typeof job?.assignReference === 'string' ? job.assignReference.trim() : '';
      if (name) {
        this.jobs.set(name.toLowerCase(), {name, class: job.class || job.javaClass});
      }
    }
    this.jobsLoaded = true;
  }

  /** Whether the job list is known, i.e. findJob() can decide on a job name without loading it. */
  hasJobList(): boolean {
    return this.jobsLoaded;
  }

  /**
   * Loads the job list (API inventory/wizard/jobs) once per session. Callers during a running request share it.
   * Emits true when the list is available, false when the request failed (a later call tries again).
   */
  loadJobs(language: string): Observable<boolean> {
    if (this.jobsLoaded) {
      return of(true);
    }
    if (!this.jobsRequest$) {
      this.jobsRequest$ = this.http.post('inventory/wizard/jobs', {language}).pipe(
        map((res: any) => {
          this.setJobs(res?.jobs);
          this.jobsLoaded = true; // also for a response without jobs: do not request again
          return true;
        }),
        catchError(() => of(false)),
        finalize(() => this.jobsRequest$ = null),
        shareReplay(1)
      );
    }
    return this.jobsRequest$;
  }

  /**
   * Returns the JITL job when the documentation reference belongs to a JITL job:
   *  - "/jitl-jobdoc/<name>.md", "sos/jitl-jobs/<name>.md" or "/sos/jitl-jobs/<name>.xml" (docPath), only .md, .xml or no extension, or
   *  - "<name>" when it is a known JITL job name (assignReference; stored as documentationName of jobs), or
   *  - "<name>.md" or "<name>.xml" when <name> is a known JITL job name (docName; stored as documentationName of job templates).
   * Synchronous: returns null when the reference is unknown, then the caller keeps the old behaviour.
   */
  findJob(reference: string): JitlJob | null {
    if (!reference || typeof reference !== 'string') {
      return null;
    }
    const ref = reference.trim();
    const pathMatch = ref.match(this.jitlDocFolder);
    if (pathMatch) {
      return this.jobs.get(pathMatch[1].toLowerCase()) || {name: pathMatch[1]};
    }
    if (ref.includes('/')) {
      return null;
    }
    const nameMatch = ref.match(this.jitlDocName);
    return this.jobs.get(ref.toLowerCase()) || (nameMatch && this.jobs.get(nameMatch[1].toLowerCase())) || null;
  }

  /**
   * The API inventory/wizard/job returns the arguments of JITL jobs with "dataType" (STRING, BOOLEAN, INTEGER, ...)
   * and "defaultValue" (former "type": String|Boolean|Number and "default", as used by job templates):
   * converts an argument in place to the former fields, an argument with the former fields is not changed.
   */
  normalizeArgument(arg: any): any {
    if (!arg || typeof arg !== 'object') {
      return arg;
    }
    if (arg.dataType !== undefined) {
      if (arg.type === undefined) {
        arg.type = this.toArgumentType(arg.dataType);
      }
      delete arg.dataType;
    }
    if (arg.defaultValue !== undefined) {
      if (arg.default === undefined) {
        arg.default = arg.defaultValue;
      }
      delete arg.defaultValue;
    }
    return arg;
  }

  private toArgumentType(dataType: any): string {
    const type = typeof dataType === 'string' ? dataType.trim().toUpperCase() : '';
    if (type === 'BOOLEAN') {
      return 'Boolean';
    }
    if (/INTEGER$/.test(type) || type === 'NUMBER') {
      return 'Number';
    }
    return 'String';
  }

  getJobHtml(name: string, requestedLang: string): Observable<HelpRenderResult | null> {
    if (!name || !/^[A-Za-z0-9_.-]+$/.test(name)) {
      return of(null);
    }
    const job: JitlJob = this.jobs.get(name.toLowerCase()) || {name};
    const lang = requestedLang || 'en';
    const render = (markdown: string) => this.render(markdown);
    return forkJoin({
      meta: this.loadMeta(`${name}.json`),
      text: this.loadMarkdown(lang, `${name}.md`)
    }).pipe(
      map(({meta, text}) => {
        if (!text && !meta.job) {
          return null;
        }
        const markdown = this.composeMarkdown(job, meta, text ? text.markdown : `# Job: ${name}\n`);
        const usedLang = text ? text.usedLang : lang;
        return {html: render(markdown), requestedLang: lang, usedLang, fellBack: usedLang !== lang};
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Descriptions for the Job Wizard, taken from <lang>/<name>.md with all includes resolved (the API returns the
   * same texts as Markdown, but without the folder of the file, so their relative includes cannot be resolved):
   *  - job:  content of <detail>
   *  - args: content of <article id="<argument name>">
   * Values are rendered HTML; missing parts are left out, the caller then keeps the description of the API.
   */
  getWizardDescriptions(name: string, requestedLang: string): Observable<{ job: string | null; args: Map<string, string> }> {
    const empty = {job: null, args: new Map<string, string>()};
    if (!name || !/^[A-Za-z0-9_.-]+$/.test(name)) {
      return of(empty);
    }
    return this.loadMarkdown(requestedLang || 'en', `${name}.md`).pipe(
      map(text => {
        if (!text) {
          return empty;
        }
        const args = new Map<string, string>();
        const articleRe = /<article\s+id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/article>/gi;
        let match: RegExpExecArray | null;
        while ((match = articleRe.exec(text.markdown)) !== null) {
          const html = this.renderFragment(match[2]);
          if (html && !args.has(match[1])) {
            args.set(match[1], html);
          }
        }
        const detail = text.markdown.match(/<detail\b[^>]*>([\s\S]*?)<\/detail>/i);
        return {job: (detail && this.renderFragment(detail[1])) || null, args};
      }),
      catchError(() => of(empty))
    );
  }

  /**
   * Converts a description of the API inventory/wizard/job to HTML: Markdown (new documentation) is rendered,
   * HTML (former XSLT output) is returned unchanged. Include lines cannot be resolved here and are dropped.
   */
  descriptionToHtml(text: string): string {
    if (!text || typeof text !== 'string') {
      return text;
    }
    if (/^\s*<(?!\/?(summary|detail|article)\b)[a-z][^>]*>/i.test(text)) {
      return text;
    }
    return this.renderFragment(text.replace(/^[ \t]*\[\]\(include:[^)\s]*\)[ \t]*$/gm, ''));
  }

  private render(markdown: string): string {
    return this.md.parseMarkdown(markdown, {
      gfm: true,
      tables: true,
      breaks: false,
      smartypants: true,
      headerIds: true,
      headerPrefix: '',
      rawHtml: true,
      sanitize: true,
    });
  }

  /** Renders a part of a job's Markdown: marker tags and notes about missing includes are left out. */
  private renderFragment(markdown: string): string {
    const cleaned = markdown.split('\n')
      .filter(line => !/^\s*>\s*\*Missing documentation part:/.test(line))
      .join('\n')
      .replace(/<\/?(summary|detail|article)\b[^>]*>/gi, '');
    return cleaned.trim() ? this.render(cleaned) : '';
  }

  // ---------- loading ----------

  /** Fetches a file below the base path as text, cached; null when it does not exist. */
  private getText(path: string): Observable<string | null> {
    if (!this.fileCache.has(path)) {
      const headers = new HttpHeaders({'X-Access-Token': this.authService.accessTokenId || ''});
      this.fileCache.set(path, this.http.get(`${this.basePath}/${path}`, {responseType: 'text', headers}).pipe(
        // A server with an SPA fallback may answer a missing file with index.html: treat that as missing.
        map(text => /^\s*<(!doctype\s+html|html)[\s>]/i.test(text) ? null : text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')),
        catchError(() => of(null)),
        shareReplay(1)
      ));
    }
    return this.fileCache.get(path)!;
  }

  /** Loads <job>.json and resolves "$ref" entries of arguments and returnVariables. */
  private loadMeta(file: string): Observable<{ job: any; arguments: any[]; returnVariables: any[]; error?: string }> {
    return this.getText(file).pipe(
      switchMap(text => {
        const doc = this.parseJson(text);
        // Current format: job, arguments and returnVariables on top level; first archive: wrapped in "documentation".
        const documentation = (doc && typeof doc === 'object' && doc.documentation && typeof doc.documentation === 'object')
          ? doc.documentation : doc;
        if (!documentation || typeof documentation !== 'object' || Array.isArray(documentation)
          || !(documentation.job || Array.isArray(documentation.arguments) || Array.isArray(documentation.returnVariables))) {
          return of({job: null, arguments: [], returnVariables: [], error: file});
        }
        return forkJoin({
          arguments: this.resolveRefs(documentation.arguments, 0),
          returnVariables: this.resolveRefs(documentation.returnVariables, 0)
        }).pipe(map(res => ({job: documentation.job, ...res})));
      })
    );
  }

  private resolveRefs(items: any, depth: number): Observable<any[]> {
    if (!Array.isArray(items) || items.length === 0) {
      return of([]);
    }
    return forkJoin(items.map(item => {
      if (!item || typeof item !== 'object' || typeof item.$ref !== 'string') {
        return of([item]);
      }
      const path = this.normalizePath(item.$ref);
      if (!path || depth >= this.maxIncludeDepth) {
        return of([{name: item.$ref, missing: true}]);
      }
      return this.getText(path).pipe(switchMap(text => {
        const value = this.parseJson(text);
        if (value === undefined) {
          return of([{name: item.$ref, missing: true}]);
        }
        return this.resolveRefs(Array.isArray(value) ? value : [value], depth + 1);
      }));
    })).pipe(map(lists => ([] as any[]).concat(...lists)));
  }

  /** Loads <lang>/<file> (falls back to en) and resolves all includes. */
  private loadMarkdown(lang: string, file: string): Observable<{ markdown: string; usedLang: string } | null> {
    const load = (useLang: string) => this.getText(`${useLang}/${file}`).pipe(
      switchMap(text => text === null ? of(null) : this.resolveIncludes(text, `${useLang}/${file}`, useLang, 0, new Set([`${useLang}/${file}`])).pipe(
        map(markdown => ({markdown, usedLang: useLang}))
      ))
    );
    return load(lang).pipe(switchMap(res => (res || lang === 'en') ? of(res) : load('en')));
  }

  /**
   * Replaces lines of the form [](include:path) with the content of the referenced Markdown file.
   * Paths are relative to the language folder of the including file (e.g. "include/common/notes/x.md" -> "en/include/...");
   * paths starting with "./" or "../" are relative to the including file. They must stay inside the base folder
   * and must point to .md files.
   */
  private resolveIncludes(text: string, filePath: string, lang: string, depth: number, visited: Set<string>): Observable<string> {
    const includeRe = /^[ \t]*\[\]\(include:([^)\s]+)\)[ \t]*$/;
    const langFolder = filePath.split('/')[0];
    const lines = text.split('\n');
    const parts = lines.map(line => {
      const m = line.match(includeRe);
      if (!m) {
        return of(line);
      }
      const fileRelative = /^\.\.?\//.test(m[1]);
      const target = this.normalizePath(m[1], fileRelative ? filePath : `${langFolder}/`);
      if (!target || !/\.md$/i.test(target) || depth >= this.maxIncludeDepth || visited.has(target)) {
        return of(this.missingInclude(m[1]));
      }
      const fallback = lang !== 'en' && target.startsWith(lang + '/') ? 'en/' + target.substring(lang.length + 1) : null;
      return this.getText(target).pipe(
        switchMap(content => (content === null && fallback) ? this.getText(fallback) : of(content)),
        switchMap(content => {
          if (content === null) {
            return of(this.missingInclude(m[1]));
          }
          return this.resolveIncludes(content, target, lang, depth + 1, new Set([...visited, target]))
            .pipe(map(resolved => '\n' + resolved + '\n'));
        })
      );
    });
    return forkJoin(parts).pipe(map(result => result.join('\n')));
  }

  private missingInclude(path: string): string {
    return `\n> *Missing documentation part: ${this.escapeMd(path)}*\n`;
  }

  /** Resolves a relative path against the folder of `fromFile`; returns null when it leaves the base folder. */
  private normalizePath(path: string, fromFile?: string): string | null {
    if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('/') || path.includes('\\')) {
      return null;
    }
    const segments = fromFile ? fromFile.split('/').slice(0, -1) : [];
    for (const segment of path.split('/')) {
      if (segment === '' || segment === '.') {
        continue;
      }
      if (segment === '..') {
        if (segments.length === 0) {
          return null;
        }
        segments.pop();
      } else {
        segments.push(segment);
      }
    }
    return segments.length ? segments.join('/') : null;
  }

  private parseJson(text: string | null): any {
    if (text === null) {
      return undefined;
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return undefined;
    }
  }

  // ---------- composing ----------

  /** Adds the tables built from the JSON and turns the markers into plain Markdown. */
  private composeMarkdown(job: JitlJob, meta: any, markdown: string): string {
    const lines = this.convertMarkers(markdown).split('\n');

    const classTable = this.classTable(job, meta.job);
    const argTable = meta.arguments.length ? this.variableTable(meta.arguments) : '';
    const returnTable = meta.returnVariables.length ? this.variableTable(meta.returnVariables) : '';
    const error = meta.error ? `> *Missing documentation part: ${this.escapeMd(meta.error)}*\n` : '';

    const insertAfterHeading = (re: RegExp, block: string): boolean => {
      const idx = lines.findIndex(line => re.test(line));
      if (idx < 0) {
        return false;
      }
      lines.splice(idx + 1, 0, '', block, '');
      return true;
    };

    if (argTable && !insertAfterHeading(/^#{1,3}\s+Arguments\s*$/i, argTable)) {
      lines.push('', `## ${this.translate.instant('workflow.label.arguments')}`, '', argTable);
    }
    if (returnTable && !insertAfterHeading(/^#{1,3}\s+Return\s+Variables\s*$/i, returnTable)) {
      lines.push('', '## Return Variables', '', returnTable);
    }

    // Class table directly before the first section after the title (and summary).
    const firstSection = lines.findIndex((line, i) => i > 0 && /^#{1,3}\s+/.test(line));
    const head = [error, classTable, ''].join('\n');
    if (firstSection > 0) {
      lines.splice(firstSection, 0, head);
    } else {
      lines.push('', head);
    }
    return lines.join('\n');
  }

  /**
   * <summary>, <detail> and <article> are only markers. The Markdown parser treats a line with an opening tag
   * as a raw HTML block, so the Markdown inside would not be rendered: remove the marker lines and keep
   * the id of <article id="x"> as heading id of the preceding heading (anchor for the argument tables).
   */
  private convertMarkers(markdown: string): string {
    const out: string[] = [];
    for (const line of markdown.split('\n')) {
      const article = line.match(/^\s*<article\s+id=["']([^"']+)["'][^>]*>\s*$/i);
      if (article) {
        const id = article[1].replace(/[^A-Za-z0-9._:-]/g, '');
        let prev = out.length - 1;
        while (prev >= 0 && /^\s*$/.test(out[prev])) {
          prev--;
        }
        if (prev >= 0 && /^#{1,6}\s+/.test(out[prev]) && !/\{#[^}]+\}\s*$/.test(out[prev])) {
          out[prev] = out[prev].replace(/\s*$/, '') + ` {#${id}}`;
        } else if (id) {
          out.push(`<span id="${id}"></span>`);
        }
        out.push('');
        continue;
      }
      // Remaining marker tags (on their own line or inline) are dropped, their content stays.
      const cleaned = line.replace(/<\/?(summary|detail|article)\b[^>]*>/gi, '');
      out.push(cleaned.trim() === '' && line.trim() !== '' ? '' : cleaned);
    }
    return out.join('\n');
  }

  private classTable(job: JitlJob, meta: any): string {
    const t = (key: string) => this.translate.instant(key);
    const rows: string[] = [
      `| ${t('workflow.wizard.label.class')} | ${this.cell(meta?.class || job.class)} |`,
      '|---|---|'
    ];
    if (meta?.language) {
      rows.push(`| ${t('profile.label.language')} | ${this.cell(meta.language)} |`);
    }
    return rows.join('\n');
  }

  private variableTable(items: any[]): string {
    const t = (key: string) => this.translate.instant(key);
    const rows = [
      `| ${t('common.label.name')} | ${t('workflow.label.required')} | ${t('common.label.type')} | ${t('settings.label.default')} |`,
      '|---|---|---|---|'
    ];
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      if (item.missing) {
        rows.push(`| *${this.cell(item.name)}* | | | |`);
        continue;
      }
      // The parser would render the link text "max_file_size" as "max<em>file</em>size". Backslash escapes do not help:
      // table cells drop them before the inline rendering, so _ and * are written as character references.
      const name = item.name
        ? `[${this.cell(item.name).replace(/_/g, '&#95;').replace(/\*/g, '&#42;')}](#${encodeURIComponent(item.name)})` : '';
      const required = item.required === true ? t('common.label.yes') : (item.required === false ? t('common.label.no') : '');
      const def = item.defaultValue !== undefined && item.defaultValue !== null && item.defaultValue !== ''
        ? '`' + String(item.defaultValue).replace(/`/g, '') + '`' : '';
      rows.push(`| ${name} | ${required} | ${this.cell(item.dataType)} | ${def} |`);
    }
    return rows.join('\n');
  }

  private cell(value: any): string {
    return value === undefined || value === null ? '' : this.escapeMd(String(value)).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }

  private escapeMd(value: string): string {
    return value.replace(/[<>]/g, ch => (ch === '<' ? '&lt;' : '&gt;'));
  }
}
