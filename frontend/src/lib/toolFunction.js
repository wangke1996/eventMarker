import _ from 'lodash';

export function splitSentence(s, removeDuplicate = true) {
    if (!s)
        return [];
    let res = s.split(/[，。？！,.?!…]/).filter(d => d);
    if (removeDuplicate)
        res = res.filter((d, i, a) => a.indexOf(d) === i);
    return res;
}

const serverURL = 'http://119.23.210.89:3001/';

export function wrapUrl(url, randParam = true, debug_mode = false) {
    let trueURL;
    if (debug_mode)
        trueURL = serverURL + url;
    else
        trueURL = '/' + url;
    if (randParam)
        trueURL += '?time=' + (new Date().getTime());
    return trueURL;
}

export function removeDuplicate(arr) {
    return arr.filter((d, i, a) => a.indexOf(d) === i);
}

export function splitParagraph(text) {
    return text.split(/[\n\u{300}]/u).map(d => _.trim(d)).filter(d => d);
}