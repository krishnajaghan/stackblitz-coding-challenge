import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { TramService } from './app/data.service'; 

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), TramService] 
})
  .catch(err => console.error(err));