import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const cloned = req.clone({ withCredentials: true }); // send cookies
    return next(cloned);
};
