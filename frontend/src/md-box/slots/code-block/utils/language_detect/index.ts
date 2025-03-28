// import { Observable, firstValueFrom, filter, share } from 'rxjs';
// import {
//   EventSession,
//   LanguageDetectEventData,
//   LanguageDetectEventReturnData,
// } from './type';
// import { random } from 'lodash-es';

// class WorkerContext<R, P> {
//   private worker: Worker;
//   private messageObservable: Observable<EventSession<R>>;

//   constructor() {
//     this.worker = new Worker(new URL('./worker', import.meta.url));
//     this.messageObservable = new Observable<EventSession<R>>((subscriber) => {
//       this.worker.onmessage = ({ data }: MessageEvent<EventSession<R>>) => {
//         subscriber.next(data);
//       };
//     }).pipe(share());
//   }

//   call = async (data: P): Promise<R | null> => {
//     const session = String(random(10 ** 8, 10 ** 9, false));
//     const sendData: EventSession<P> = {
//       session,
//       data,
//     };
//     this.worker.postMessage(sendData);
//     try {
//       const { data } = await firstValueFrom(
//         this.messageObservable.pipe(filter((item) => item.session === session)),
//       );
//       return data;
//     } catch (error) {
//       return null;
//     }
//   };
// }

// let _languageDetectWorkerContext: null | WorkerContext<
//   LanguageDetectEventReturnData,
//   LanguageDetectEventData
// > = null;

// const getContext = () => {
//   if (!_languageDetectWorkerContext) {
//     _languageDetectWorkerContext = new WorkerContext();
//   }
//   return _languageDetectWorkerContext;
// };

// export const detectLanguage = async (code: string) => {
//   const data = await getContext().call({ code });
//   return data?.language;
// };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const detectLanguage = (code: string) => {
  // const data = await getContext().call({ code });
  return undefined;
};
