import { Pipe, PipeTransform } from "@angular/core";
import { formatInstant } from "../utils/bratislava-time";
@Pipe({ name: "instant", standalone: false })
export class InstantPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    return value && Number.isFinite(Date.parse(value))
      ? formatInstant(value)
      : "Dátum nie je dostupný";
  }
}
