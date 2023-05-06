import { BasePostMessage } from "./../types/types";
const MESSAGE = "message";

function createTypesafePostMessage<T extends BasePostMessage>() {
  return {
    post: (message: T) => {},
    listen: (callback: Function) => {
      function listener(message: MessageEvent<T>) {
        callback(message.data.payload);
      }

      window.addEventListener(MESSAGE, listener);

      return () => {
        window.removeEventListener(MESSAGE, listener);
      };
    },
  };
}

// export
