import { IconModule } from '@plopdown/icon';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './cues/info/info.component';
import { PlopComponent } from './cues/plop/plop.component';
import { CueRendererComponent } from './cue-renderer/cue-renderer.component';
import {
  SchemaFormModule,
  WidgetRegistry,
  DefaultWidgetRegistry,
} from 'ngx-schema-form';
import { AudioComponent } from './cues/audio/audio.component';
import { ShapeComponent } from './cues/shape/shape.component';

@NgModule({
  imports: [CommonModule, FormsModule, SchemaFormModule.forRoot(), IconModule],
  declarations: [
    CueRendererComponent,
    InfoComponent,
    PlopComponent,
    ShapeComponent,
    AudioComponent
  ],
  exports: [
    CueRendererComponent,
    InfoComponent,
    PlopComponent,
    ShapeComponent,
    AudioComponent
  ],
  providers: [{ provide: WidgetRegistry, useClass: DefaultWidgetRegistry }]
})
export class PlopdownCuesModule {}
