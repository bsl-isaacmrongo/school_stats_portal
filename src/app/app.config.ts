import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { provideEchartsCore } from 'ngx-echarts';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEchartsCore({
      echarts: () => import('echarts')
    }),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideToastr()
  ]
};



