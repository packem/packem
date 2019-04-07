import * as MAX_TIMEOUT from "./another";

export default async (cb, t): Promise<any> =>
  new Promise((resolve) => {
    return resolve(setTimeout(cb, t));
  });

// Some weird interface
// interface Person {
//   name?: string;
//   age?: number;
// }

// /**
//  * A Person class
//  */
// export default (obj: object): Person => obj as Person;

// export class Exposer {
//   static propType: object = {
//     isMixed: true,
//     variadicExpression: /\s+?(w+)/gi
//   };
// }
