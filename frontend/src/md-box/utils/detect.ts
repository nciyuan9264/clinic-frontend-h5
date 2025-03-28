let _isSafari: boolean | undefined;

export function isSafari() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  if (typeof _isSafari === 'undefined') {
    _isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
  return _isSafari;
}
