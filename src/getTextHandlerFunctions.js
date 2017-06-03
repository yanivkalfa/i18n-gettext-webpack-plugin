function createReturnString(singular, plural, params, key) {
  return `(function __ngt(singular, plural, quantity) { return quantity == 1 ? singular : plural; })('${singular}', '${plural}', ${(params[key].name || params[key].value)})`;
}

const singular = 1;
const plural = 3;

export default [
  {
    name: 'gettext',
    handle: (GetText, params) => {
      return JSON.stringify(GetText.gettext(params[0].value));
    }
  },
  {
    name: 'dgettext',
    handle: (GetText, params) => {
      return JSON.stringify(GetText.dgettext.(params[0].value, params[1].value));
    }
  },
  {
    name: 'ngettext',
    handle: (GetText, params) => {
      let singular = GetText.ngettext(params[0].value, params[1].value, singular);
      let plural = GetText.ngettext(params[0].value, params[1].value, plural);
      return createReturnString(singular, plural, params, 2);
    }
  },
  {
    name: 'dngettext',
    handle: (GetText, params) => {
      let singular = GetText.dngettext(params[0].value, params[1].value, params[2].value, singular);
      let plural = GetText.dngettext(params[0].value, params[1].value, params[2].value, plural);
      return createReturnString(singular, plural, params, 3);
    }
  },
  {
    name: 'pgettext',
    handle: (GetText, params) => {
      params = params.map((param) => {
        return param.value;
      });
      return JSON.stringify(GetText.pgettext.apply(GetText, params));
    }
  },
  {
    name: 'dpgettext',
    handle: (GetText, params) => {
      params = params.map((param) => {
        return param.value;
      });
      return JSON.stringify(GetText.dpgettext.apply(GetText, params));
    }
  },
  {
    name: 'npgettext',
    handle: (GetText, params) => {
      let singular = GetText.npgettext(params[0].value, params[1].value, params[2].value, singular);
      let plural = GetText.npgettext(params[0].value, params[1].value, params[2].value, plural);
      return createReturnString(singular, plural, params, 3);
    }
  },
  {
    name: 'dnpgettext',
    handle: (GetText, params) => {
      let singular = GetText.dnpgettext(params[0].value, params[1].value, params[2].value, params[3].value, singular);
      let plural = GetText.dnpgettext(params[0].value, params[1].value, params[2].value, params[3].value, plural);
      return createReturnString(singular, plural, params, 4);
    }
  }
];