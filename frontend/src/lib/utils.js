import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(profilePhoto, empName = 'User', empId = 1) {
  if (profilePhoto && typeof profilePhoto === 'string' && profilePhoto.trim() !== '') {
    if (profilePhoto.startsWith('http')) return profilePhoto;
    return `http://localhost:3000${profilePhoto.startsWith('/') ? '' : '/'}${profilePhoto}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=2563EB&color=fff&bold=true`;
}