import { LoggerService } from '@plopdown/logger';
import { ContentScriptPubService } from '@plopdown/messages';
import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit
} from '@angular/core';

@Component({
  selector: 'plopdown-cs',
  template: `
    <plopdown-content-scanner></plopdown-content-scanner>
    <plopdown-video-attachments></plopdown-video-attachments>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {
  constructor(
    private csPub: ContentScriptPubService,
    private logger: LoggerService
  ) {}

  ngAfterViewInit(): void {
    this.logger.debug('Content script ready');
    this.csPub.ready();
  }
}
