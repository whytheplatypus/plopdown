import { MockLoggerModule } from '@plopdown/logger/mock';
import { MockMessagesModule } from '@plopdown/messages/mock';
import { MockVideoAttachmentsComponent } from '@plopdown/plopdown-injector/mock';
import { MockContentScannerComponent } from './../../mock/content-scanner.component.mock';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MockLoggerModule, MockMessagesModule],
      declarations: [
        AppComponent,
        MockContentScannerComponent,
        MockVideoAttachmentsComponent,
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
