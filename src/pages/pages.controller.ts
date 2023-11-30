import { Body, Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { Express } from 'express';

import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HttpCode(201)
  create(
    @Request() req: Express.Request,
    @Body() createPageDto: CreatePageDto,
  ) {
    return this.pagesService.create(req.user, createPageDto);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }
}
