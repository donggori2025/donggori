export const demoProductUrl = "https://www.musinsa.com/products/7487035";
const sampleRequest = `이 링크의 숏 파카를 참고해서 3컬러 47장을 제작하려고 해요. 공장에 보낼 작업지시서를 만들어 주세요.`;
export const demoPrompt = `${demoProductUrl}\n${sampleRequest}`;

export function readDemoRequest(text: string) {
  const match = text.match(/(?:https?:\/\/|www\.|(?:[a-z0-9-]+\.)*musinsa\.com\/)[^\s<>"']+/i);
  if (!match) return null;
  const address = match[0].replace(/[),.\]}>]+$/, "");
  try {
    const url = new URL(/^https?:\/\//i.test(address) ? address : `https://${address}`);
    const sample = /(^|\.)musinsa\.com$/i.test(url.hostname) && /\/7487035\/?$/.test(url.pathname);
    return { address, source: url.hostname, request: text.replace(match[0], "").trim(), sample };
  } catch {
    return null;
  }
}

export function requestQuantity(text: string) {
  const total = text.match(/(?:총(?:수량)?|합계)\s*[:：]?\s*([\d,]+)\s*(?:장|벌)/);
  const counts = [...text.matchAll(/(\d[\d,]*)\s*(?:장|벌)/g)];
  // Only add explicitly named color allocations. Sample/production quantities and alternatives need confirmation.
  const color = /(?:블랙|검정|검은색|네이비|남색|화이트|흰색|아이보리|베이지|카키|올리브|그레이|회색|블루|파랑|레드|빨강|핑크|브라운|그린|노랑|옐로우|퍼플|보라)(?:색|컬러)?\s*[:：]?\s*$/;
  const allocations = counts.length > 1 && !/(또는|혹은|아니면|내지|~|～|\bOR\b)/i.test(text) &&
    counts.every(match => color.test(text.slice(0, match.index)));
  const number = (value: string) => Number(value.replaceAll(",", ""));
  const quantity = total ? number(total[1]) : counts.length === 1 ? number(counts[0][1])
    : allocations ? counts.reduce((sum, match) => sum + number(match[1]), 0) : 0;
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
}

export function parkaOrder(request: string) {
  const sample = !request || request === sampleRequest;
  const text = sample ? "3컬러 총 47장 (올리브 18장, 다크올리브 11장, 블랙 18장)" : request;
  return { sample, text, quantity: sample ? 47 : requestQuantity(request) };
}
