export default [
  { name: 'gettext', handler: (params, GetText) => {
    return GetText.gettext.apply(GetText, params);
  }},
  { name: 'dgettext', handler: (params, GetText) => {
    return GetText.gettext.apply(GetText, params);
  }},
  { name: 'ngettext', handler: (params, GetText) => {
    let singular = GetText.ngettext(params[0], params[1], 1);
    let plural = GetText.ngettext(params[0], params[1], 3);
    return `ngettext(${singular}, ${plural}, ${params[2]})`;
  }},
  { name: 'dngettext', handler: (params, GetText) => {
    let singular = GetText.dngettext(params[0], params[1], params[2], 1);
    let plural = GetText.dngettext(params[0], params[1], params[2], 3);
    return `ngettext(${singular}, ${plural}, ${params[3]})`;
  }},
  { name: 'pgettext', handler: (params, GetText) => {
    return GetText.pgettext.apply(GetText, params);
  }},
  { name: 'dpgettext', handler: (params, GetText) => {
    return GetText.dpgettext.apply(GetText, params);
  }},
  { name: 'npgettext', handler: (params, GetText) => {
    let singular = GetText.npgettext(params[0], params[1], params[2], 1);
    let plural = GetText.npgettext(params[0], params[1], params[2], 3);
    return `ngettext(${singular}, ${plural}, ${params[3]})`;
  }},
  { name: 'dnpgettext', handler: (params, GetText) => {
    let singular = GetText.dnpgettext(params[0], params[1], params[2], params[3], 1);
    let plural = GetText.dnpgettext(params[0], params[1], params[2], params[3], 3);
    return `ngettext(${singular}, ${plural}, ${params[4]})`;
  }}
];