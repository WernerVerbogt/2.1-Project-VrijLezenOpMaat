import { SetMetadata } from '@nestjs/common';

// With Metadata, we can create a custom decorator that will set a metadata key-value pair on the route handler. 
// In this case, we're setting the 'isPublic' key to true for routes that are public and don't require authentication.

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);