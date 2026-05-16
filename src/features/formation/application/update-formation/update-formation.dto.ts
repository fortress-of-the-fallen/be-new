export type UpdateFormationSlotDto = {
   slot: number;
   unitName: string;
   position: {
      x: number;
      y: number;
      z: number;
   };
};

export class UpdateFormationDto {
   name: string;
   slots: UpdateFormationSlotDto[];
}
