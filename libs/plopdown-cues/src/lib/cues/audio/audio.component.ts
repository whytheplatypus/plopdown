import { VIDEO_ELEM_TOKEN } from '@plopdown/tokens';
import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { PlopdownAudio } from './audio.model';
import { PlopdownBaseComponent } from '../../models/plopdown-base.component';
import {
  Observable,
  Subscription,
  combineLatest,
  fromEvent,
  merge,
  of
} from 'rxjs';
import { map, tap, distinctUntilChanged, filter, mapTo } from 'rxjs/operators';

@Component({
  selector: 'plopdown-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent extends PlopdownBaseComponent<PlopdownAudio>
  implements AfterViewInit, OnDestroy {
  @ViewChild('audioElem') audioElem: ElementRef<HTMLAudioElement>;

  private videoNotPlaying$: Observable<void>;
  private videoPlaying$: Observable<void>;
  private timeUpdate$: Observable<[number, number]>;
  private syncOffset$: Observable<number>;

  private audioPlaying$: Observable<void>;
  private audioStopped$: Observable<void>;
  private audioStalled$: Observable<void>;

  private subs: Subscription = new Subscription();

  constructor(@Inject(VIDEO_ELEM_TOKEN) private videoElem: HTMLVideoElement) {
    super();
  }

  ngAfterViewInit(): void {
    this.videoElem.pause();

    this.videoNotPlaying$ = merge(
      fromEvent(this.videoElem, 'suspend'),
      fromEvent(this.videoElem, 'stop'),
      fromEvent(this.videoElem, 'ended'),
      fromEvent(this.videoElem, 'stalled'),
      fromEvent(this.videoElem, 'pause')
    ).pipe(mapTo(null));

    const isPlaying = of(this.videoElem.paused).pipe(filter(paused => !paused));

    this.videoPlaying$ = merge(
      isPlaying,
      fromEvent(this.videoElem, 'playing')
    ).pipe(mapTo(null));

    this.timeUpdate$ = merge(
      fromEvent(this.audioElem.nativeElement, 'timeupdate'),
      fromEvent(this.videoElem, 'timeupdate')
    ).pipe(
      map(_ => {
        return [
          this.audioElem.nativeElement.currentTime,
          this.videoElem.currentTime
        ];
      })
    );

    this.syncOffset$ = this.timeUpdate$.pipe(
      map(([audioTime, videoTime]) => {
        const offsetTime = this.startTime + audioTime;
        return Math.round((videoTime - offsetTime) * 1000);
      }),
      distinctUntilChanged(),
      filter(offset => offset > 150 || offset < -150)
    );

    const syncSub = this.syncOffset$.subscribe(offset => {
      const currentMS = this.audioElem.nativeElement.currentTime * 1000;
      this.audioElem.nativeElement.currentTime = (currentMS + offset) / 1000;
    });
    this.subs.add(syncSub);

    const stopSub = this.videoNotPlaying$.subscribe(() => {
      this.pauseAudio();
    });
    this.subs.add(stopSub);

    const playSub = this.videoPlaying$.subscribe(() => {
      this.playAudio();
    });
    this.subs.add(playSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleMute() {
    const muted = !this.audioElem.nativeElement.muted;
    this.audioElem.nativeElement.muted = muted;
  }

  audioLoaded() {
    console.log('loaded');
    this.videoElem.play();
  }

  playAudio() {
    this.audioElem.nativeElement.play();
  }

  pauseAudio() {
    this.audioElem.nativeElement.pause();
  }
}