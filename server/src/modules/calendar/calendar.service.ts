import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { startAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? null,
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        allDay: dto.allDay ?? false,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findFirst({
      where: { id, userId },
    });
    
    if (!existing) {
      throw new NotFoundException(`Compromisso ${id} não encontrado`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt !== undefined && { endAt: dto.endAt ? new Date(dto.endAt) : null }),
        ...(dto.allDay !== undefined && { allDay: dto.allDay }),
      },
    });
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.appointment.findFirst({
      where: { id, userId },
    });
    
    if (!existing) {
      throw new NotFoundException(`Compromisso ${id} não encontrado`);
    }

    await this.prisma.appointment.delete({ where: { id } });
    return { deleted: true };
  }
}
