import { Injectable } from '@nestjs/common';

interface NominatimAddress {
  display_name: string;
  address: Record<string, string>;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async reverseGeocode(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DailyMeal/1.0',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = (await response.json()) as NominatimAddress;
      return {
        success: true,
        address: data.display_name,
        details: data.address,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }
}
