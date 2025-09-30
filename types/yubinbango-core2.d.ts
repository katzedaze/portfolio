declare module 'yubinbango-core2' {
  export default class YubinBango {
    static Core: new (
      postalCode: string,
      callback: (result: {
        region?: string;
        locality?: string;
        street?: string;
        extended?: string;
      }) => void
    ) => void;
  }
}
