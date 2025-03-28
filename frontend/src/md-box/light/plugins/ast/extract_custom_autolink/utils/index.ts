export { HyperNodeType, getHyperLinkNodes } from './parser';

export const completeProtocol = (raw: string) => {
  if (raw.match(/https?:\/\//)) {
    return raw;
  }
  return `https://${raw}`;
};
