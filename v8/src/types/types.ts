import type Zod from "zod";
import { PropsWithoutRef } from "react";

export interface AvatarModule {
  AvatarComponent: React.ReactNode;
  avatarMetadata: AvatarAssetMetadata<any>[];
  validator: Zod.AnyZodObject;
  generateCss: (validator: Zod.AnyZodObject) => string;
}

export interface ObsInput {
  inputName: string;
  inputLevelsMul?: number[][];
  oldInputName?: string;
}

export interface AvatarProps {
  isActive: boolean;
  renderTimestamp: number;
}

export interface AvatarAsset {
  name: string;
  value: string;
  type: AvatarAssetType;
  config?: Record<string, any>;
}

export enum AvatarAssetType {
  Single = "single",
  Multiple = "multiple",
}

export interface AvatarAssetComponentProps<T> {
  config: T;
  image: string;
  onModifyConfig: ((config: T) => void) | ((config: T) => Promise<void>);
}

export interface AvatarAssetMetadata<T> {
  name: string;
  required: boolean;
  type: AvatarAssetType;
  config?: T;
  configComponent?: React.ComponentType<AvatarAssetComponentProps<T>>;
}
