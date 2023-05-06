import type Zod from "zod";

export interface ThemeMetadata {
  id: string;
  label: string;
}

export interface AvatarModule {
  themeMetadata: ThemeMetadata;
  themePresets: ThemeMetadata[];
  AvatarComponent: React.ReactNode | ((props: AvatarProps) => JSX.Element);
  assetMetadata: AvatarAssetMetadata<any>[];
  validator: Zod.AnyZodObject;
  generateCss: (assets: AvatarAsset[]) => string;
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

export interface ValidationStep {
  label: string;
  valid: boolean;
  optional?: boolean;
}

export enum PostMessageType {
  Active = "active",
  Styles = "styles",
}

export interface BasePostMessage {
  type: PostMessageType;
  payload: Record<string, any>;
}

export interface ActivePostMessage extends BasePostMessage {
  type: PostMessageType.Active;
  payload: {
    active: boolean;
  };
}

export interface StylesPostMessage extends BasePostMessage {
  type: PostMessageType.Styles;
  payload: {
    styles: string;
  };
}
