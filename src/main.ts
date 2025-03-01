// import './polyfills';

// import { enableProdMode } from '@angular/core';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import { AppModule } from './app/app.module';
// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent);
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
.bootstrapModule(AppModule)
.catch((err) => console.error(err));
