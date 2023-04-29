import { AvatarModule } from "../types/types";

export function validateAvatar(mod: AvatarModule) {
  if (
    !mod.AvatarComponent ||
    !mod.assetMetadata ||
    !mod.generateCss ||
    !mod.validator
  ) {
    return false;
  }

  return true;
}
