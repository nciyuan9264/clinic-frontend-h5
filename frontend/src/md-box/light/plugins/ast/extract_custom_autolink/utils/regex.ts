// -> refer @ea/url-recognition -> refer 飞书云文档
const PROTOCOL = 'https?|s?ftp|ftps|nfs|ssh';
const LINK_SUFFIX =
  "\\b([/#?][\\-A-Z0-9@:%_+.~#?&'/=;$,!\\*\\[\\]\\(\\){}^|<>]*[-A-Z0-9&@#/%=~\\(\\)_|]?)?";
const LOCALHOST_REG = /localhost(:[0-9]{2,5})?/;
const IP_ADDRESS_REG =
  // eslint-disable-next-line max-len
  /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(2[0-4][0-9]|25[0-5]|1[0-9]{2}|[1-9][0-9]|[0-9])(:[0-9]{2,5})?/;
const IP_REG = new RegExp(
  `((((${PROTOCOL})://)?(${LOCALHOST_REG.source}))|(((${PROTOCOL})://)(${IP_ADDRESS_REG.source})))${LINK_SUFFIX}`,
  'gi',
);
const URL_HOST_BODY = '([-A-Z0-9%_+~#@][\\-A-Z:0-9%_+~#@]{0,256}\\.){1,50}';
const ANY_TOP_DOMAIN = '[a-z\\-]{2,15}';
const TOP_DOMAIN =
  'com|org|net|int|edu|gov|mil|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gh|gi|gl|gm|gn|gp|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mf|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw|site|top|wtf|xxx|xyz|cloud|engineering|help|one';
const TOP_DOMAIN_LITE = 'com|cn|tk|de|net|org|uk|info|nl|ru|hk';
// 由于顶级域名不全，故更改为带 协议头的url 忽略上面顶级域名，直接匹配
const URL_REG = new RegExp(
  // eslint-disable-next-line max-len
  `(((${PROTOCOL}):\\/\\/${URL_HOST_BODY}${ANY_TOP_DOMAIN})|(${URL_HOST_BODY}(${TOP_DOMAIN_LITE})))(:[0-9]{2,5})?${LINK_SUFFIX}`,
  'gi',
);
// mailto的贪婪匹配在遇到极长的字符串（无空格的英文）会很慢，需要限长。
const EMAIL_URL_BODY = "[\\w.!#$%&'*+-/=?^_\\`{|}~]{1,2000}@[A-Za-z0-9_.-]+\\.";
const LENGTH_LIMITED_EMAIL_REG = new RegExp(
  `^(?!data:)((mailto:${EMAIL_URL_BODY}${ANY_TOP_DOMAIN})|(${EMAIL_URL_BODY}(${TOP_DOMAIN})))\\b`,
  'gi',
);

export const urlRegExp = new RegExp(
  `(${IP_REG.source})|(${URL_REG.source})|(${LENGTH_LIMITED_EMAIL_REG.source})`,
  'gi',
);
