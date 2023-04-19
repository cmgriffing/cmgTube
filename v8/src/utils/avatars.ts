import { AvatarModule } from "../types/types";

export function validateAvatar(mod: AvatarModule) {
  if (
    !mod.AvatarComponent ||
    !mod.avatarMetadata ||
    !mod.generateCss ||
    !mod.validator
  ) {
    return false;
  }

  return true;
}
