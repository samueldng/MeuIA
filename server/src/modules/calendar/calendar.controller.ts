import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/calendar.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  findAll(@CurrentUser('id') userId: string) {
    return this.calendarService.findAll(userId);
  }

  @Post('events')
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.calendarService.create(userId, dto);
  }

  @Patch('events/:id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.calendarService.update(userId, id, dto);
  }

  @Delete('events/:id')
  delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.calendarService.delete(userId, id);
  }
}
