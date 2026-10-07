export interface BreakingChange {
  issue: string;
  title: string;
  releases: string[];
  permissions: string[];
}

export const BREAKING_CHANGES_URL = 'assets/breaking-changes/breaking-changes.json';

export const CHANGE_MANAGEMENT_URL = 'https://change.sos-berlin.com/browse/';


export function getRelease(version: any): string {
  const match = typeof version === 'string' ? version.trim().match(/^\d+\.\d+\.\d+/) : null;
  return match ? match[0] : '';
}


export function compareReleases(a: string, b: string): number {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const diff = (x[i] || 0) - (y[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function getReleaseLine(release: string): string {
  return release.split('.').slice(0, 2).join('.');
}

export function isIncludedInRelease(change: BreakingChange, release: string): boolean {
  if (!release) {
    return false;
  }
  const releases = change.releases.map(getRelease).filter(r => !!r);
  const sameLine = releases.find(r => getReleaseLine(r) === getReleaseLine(release));
  if (sameLine) {
    return compareReleases(release, sameLine) >= 0;
  }
  return releases.length > 0 && releases.every(r => compareReleases(getReleaseLine(release) + '.0', getReleaseLine(r) + '.0') > 0);
}


export function isBreakingChangeForUpgrade(change: BreakingChange, acknowledgedRelease: string, currentRelease: string): boolean {
  return isIncludedInRelease(change, currentRelease) && !isIncludedInRelease(change, acknowledgedRelease);
}

export function hasBreakingChangePermission(permission: any, path: string): boolean {
  const parts = (path || '').split(':');
  if (!permission || parts.length < 4 || parts[0] !== 'sos' || parts[1] !== 'products') {
    return false;
  }
  let roots: any[] = [];
  if (parts[2] === 'joc') {
    roots = [permission.joc];
  } else if (parts[2] === 'controller') {
    roots = [permission.currentController, permission.controllerDefaults,
      ...Object.values(permission.controllers || {})];
  }
  const normalize = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return roots.some(root => {
    let obj = root;
    for (const part of parts.slice(3)) {
      if (!obj || typeof obj !== 'object') {
        return false;
      }
      const key = Object.keys(obj).find(k => normalize(k) === normalize(part));
      obj = key !== undefined ? obj[key] : undefined;
    }
    return obj === true;
  });
}

export function getBreakingChangesGotIt(coreService: any, cb: (acknowledgedRelease: string) => void): void {
  if (sessionStorage.getItem('breakingChangesGotIt') !== null) {
    cb(getRelease(sessionStorage.getItem('breakingChangesGotIt')));
    return;
  }
  coreService.post('configurations', {configurationType: 'GLOBALS'}).subscribe({
    next: (res: any) => {
      let acknowledgedRelease = '';
      if (res.configurations && res.configurations[0] && res.configurations[0].configurationItem) {
        const configuration = JSON.parse(res.configurations[0].configurationItem);
        acknowledgedRelease = getRelease(configuration?.user?.breaking_changes_got_it?.value);
      }
      cb(acknowledgedRelease);
    }, error: () => {
    }
  });
}

export function parseBreakingChanges(data: any): BreakingChange[] {
  const changes: BreakingChange[] = [];
  if (data && Array.isArray(data.breakingChanges)) {
    for (const entry of data.breakingChanges) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      for (const issue of Object.keys(entry)) {
        const change = entry[issue] || {};
        changes.push({
          issue,
          title: change.title || '',
          releases: Array.isArray(change.releases) ? change.releases : [],
          permissions: Array.isArray(change.permissions) ? change.permissions : []
        });
      }
    }
  }
  return changes;
}
