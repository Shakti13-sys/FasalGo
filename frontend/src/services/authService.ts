import type { Farmer } from '@/types';
import { mockFarmer } from '@/data/mockData';

export interface LoginCredentials {
  mobile: string;
  password: string;
}

export interface RegisterData {
  name: string;
  mobile: string;
  password: string;
  location: string;
  state: string;
  district: string;
  crop: string;
  expectedQuantity: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(credentials: LoginCredentials): Promise<Farmer> {
  await delay(800);
  return { ...mockFarmer, mobile: credentials.mobile || mockFarmer.mobile };
}

export async function register(data: RegisterData): Promise<Farmer> {
  await delay(1000);
  return {
    id: 'f1',
    name: data.name,
    mobile: data.mobile,
    location: data.location,
    state: data.state,
    district: data.district,
    crop: data.crop,
    expectedQuantity: data.expectedQuantity,
  };
}

export async function logout(): Promise<void> {
  await delay(300);
}
