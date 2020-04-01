import { Command } from '../messages.model';
import type { VideoElementRef } from '@plopdown/video-elem-refs';

export type ContentScriptReady = Command<'CS_READY'>;
export type ContentScriptVideosFound = Command<
  'CS_VIDEOS_FOUND',
  VideoElementRef[]
>;

export type ContentScriptIFramesFound = Command<'CS_IFRAMES_FOUND', string[]>;

export type ContentScriptCommand =
  | ContentScriptReady
  | ContentScriptVideosFound
  | ContentScriptIFramesFound;
