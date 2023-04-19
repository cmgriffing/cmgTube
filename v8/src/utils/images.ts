export async function dataUriToFile(dataUri: string, id = Date.now()) {
  let filename: string | null = null;
  if (!dataUri.startsWith("data:")) {
    filename = dataUri.split("/").at(-1) || null;
  }
  const source: Blob = await fetch(dataUri, { cache: "no-cache" }).then(
    (response) => response.blob()
  );
  if (!filename) {
    filename = id + "." + source.type.split("/")[1];
  }
  return new File([source], filename, { type: source.type });
}

export async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = function (result) {
        try {
          if (result.loaded && fileReader.result) {
            if (typeof fileReader.result === "string") {
              resolve(fileReader.result);
            } else {
              resolve(fileReader.result.toString());
            }
          }
        } catch (error: any) {
          reject(error);
        }
      };

      fileReader.onerror = function (error) {
        reject(error);
      };

      fileReader.readAsDataURL(file);
    } catch (error: any) {
      reject(error);
    }
  });
}
