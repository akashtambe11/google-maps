import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    
    // AGM API key Integartion
    // AgmCoreModule.forRoot({
    //   apiKey: 'ENTER_YOUR_KEY'
    // }),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
