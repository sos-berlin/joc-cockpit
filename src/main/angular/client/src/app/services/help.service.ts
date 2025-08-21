import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class HelpService {
    private readonly defaultLanguage = 'en';
    private readonly helpBasePath = 'assets/help-files'; // Updated to match your structure

    constructor(
        private http: HttpClient,
        private translateService: TranslateService
    ) {}

    getHelpContent(helpKey: string, language?: string): Observable<string> {
        const currentLang = language || this.translateService.currentLang || this.defaultLanguage;

        // Use helpKey directly as filename (e.g., 'advanced-search')
        const fileName = helpKey;

        // Try to load help file in requested language
        return this.loadHelpFile(fileName, currentLang).pipe(
            map(content => this.parseSimpleMarkdown(content)),
            catchError(() => {
                // Fallback to English if requested language file doesn't exist
                if (currentLang !== this.defaultLanguage) {
                    return this.loadHelpFile(fileName, this.defaultLanguage).pipe(
                        map(content => this.parseSimpleMarkdown(content)),
                        catchError(() => of('<p>Help content not available.</p>'))
                    );
                }
                return of('<p>Help content not available.</p>');
            })
        );
    }

    private loadHelpFile(fileName: string, language: string): Observable<string> {
        const filePath = `${this.helpBasePath}/${language}/${fileName}.md`; // .md extension
        return this.http.get(filePath, { responseType: 'text' });
    }

    checkHelpFileExists(helpKey: string, language: string): Observable<boolean> {
        const filePath = `${this.helpBasePath}/${language}/${helpKey}.md`;

        return this.http.head(filePath).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    // Simple markdown parser for basic formatting
    private parseSimpleMarkdown(markdown: string): string {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

        // Code blocks
        html = html.replace(/``````/gim, '<pre><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank">$1</a>');

        // Unordered lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\+ (.*$)/gim, '<li>$1</li>');

        // Ordered lists
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        // Wrap consecutive <li> elements in <ul> or <ol>
        html = html.replace(/(<li>.*<\/li>\s*)+/gims, (match) => {
            return '<ul>' + match + '</ul>';
        });

        // Line breaks and paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/gim, '');
        html = html.replace(/<p>\s*<\/p>/gim, '');

        return html;
    }
}
