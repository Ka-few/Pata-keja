import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../media/media.service';

@Controller('properties')
export class PropertiesController {
    constructor(
        private readonly propertiesService: PropertiesService,
        private readonly mediaService: MediaService,
    ) { }

    @Get()
    findAll(@Query() query: any) {
        return this.propertiesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.propertiesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('REALTOR', 'ADMIN')
    @Post()
    @UseInterceptors(FilesInterceptor('files'))
    async create(
        @Request() req: any,
        @Body() dto: CreatePropertyDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const property = await this.propertiesService.create(req.user.id, dto);

        if (files && files.length > 0) {
            for (const file of files) {
                const { url } = await this.mediaService.uploadFile(file);
                await this.propertiesService.addMedia(property.id, url);
            }
        }

        return property;
    }
}
