import { SavedTrack } from '@plopdown/tracks';
import { LoggerService } from '@plopdown/logger';
import { XPathService, WindowRefService } from '@plopdown/window-ref';
import {
  Component,
  OnInit,
  Input,
  Injector,
  ApplicationRef,
  EmbeddedViewRef,
  ComponentRef,
  OnDestroy,
  ComponentFactoryResolver,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import {
  VIDEO_ELEM_TOKEN,
  TRACK_TOKEN,
  TRACK_FILES_TOKEN,
} from '@plopdown/tokens';
import { map, filter, startWith, distinctUntilChanged } from 'rxjs/operators';
import { StageComponent } from '@plopdown/plopdown-embed';

@Component({
  selector: 'plopdown-video-attachment',
  template: '',
})
export class VideoAttachmentComponent implements OnInit, OnDestroy {
  private videoElem: HTMLVideoElement | null;
  private subs: Subscription = new Subscription();
  private files: Map<string, string>;
  private overlayComponentRef: ComponentRef<StageComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private xpathService: XPathService,
    private windowRef: WindowRefService,
    private logger: LoggerService,
    private appRef: ApplicationRef
  ) {}

  @Input() public xpath: string;
  @Input() public duration: number;
  @Input() public track: SavedTrack;

  ngOnInit(): void {
    this.videoElem = this.xpathService.getElement<HTMLVideoElement>(this.xpath);

    if (this.videoElem == null) {
      this.logger.warn('No video found matching xpath.', this.videoElem);
      return;
    }

    this.firefoxFix(this.videoElem);

    const waitUntilLoadedSub = fromEvent(this.videoElem, 'onloadedmetadata')
      .pipe(
        map(() => {
          return this.videoElem.duration;
        }),
        startWith(this.videoElem.duration),
        filter((duration) => !isNaN(duration)),
        distinctUntilChanged()
      )
      .subscribe((duration) => {
        this.bindAttachment();
      });
    this.subs.add(waitUntilLoadedSub);
  }

  private bindAttachment() {
    if (this.videoElem.duration !== this.duration) {
      this.logger.error('Duration of video did not match.');
      return;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      StageComponent
    );

    if (this.track == null) {
      this.logger.error('Could not find associated track.');
    }

    if (this.track._attachments) {
      this.logger.debug('Mapping Files', this.track._attachments);
      this.files = this.createFileLookup(this.track._attachments);
      this.logger.debug('Files Mapped', this.files);
    }

    const componentInjector = Injector.create({
      providers: [
        { provide: VIDEO_ELEM_TOKEN, useValue: this.videoElem },
        { provide: TRACK_TOKEN, useValue: this.track },
        { provide: TRACK_FILES_TOKEN, useValue: this.files },
      ],
    });

    const componentRef = componentFactory.create(componentInjector);
    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    this.videoElem.offsetParent.append(domElem);

    this.overlayComponentRef = componentRef;

    componentRef.changeDetectorRef.detectChanges();

    const removeSub = this.overlayComponentRef.instance.remove.subscribe(() => {
      this.ngOnDestroy();
    });
    this.subs.add(removeSub);
  }

  ngOnDestroy(): void {
    if (this.overlayComponentRef) {
      this.appRef.detachView(this.overlayComponentRef.hostView);
      this.overlayComponentRef.destroy();
      this.overlayComponentRef.location.nativeElement.remove();
    }
    this.subs.unsubscribe();
  }

  /**
   * Forces the browser to start and stop the video,
   * rendering annotations.
   *
   * @param video - Video element to force load.
   */
  firefoxFix(video: HTMLVideoElement) {
    video.play();
    video.pause();
  }

  private createFileLookup(attachments: {
    [key: string]: PouchDB.Core.FullAttachment;
  }): Map<string, string> {
    return Object.keys(attachments).reduce((memo, filename) => {
      const attachment = attachments[filename] as PouchDB.Core.FullAttachment;
      const blobUrl = this.windowRef.getURL().createObjectURL(attachment.data);
      memo.set(filename, blobUrl);
      return memo;
    }, new Map<string, string>());
  }
}
