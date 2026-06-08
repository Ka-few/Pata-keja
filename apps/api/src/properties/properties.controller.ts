import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../media/media.service';
import { PropertyStatus, VerificationStatus } from '@prisma/client';

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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('REALTOR', 'ADMIN')
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('files'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePropertyDto,
        @Request() req: any,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        const updatedProperty = await this.propertiesService.update(id, req.user.id, req.user.role, dto);
        
        if (files && files.length > 0) {
            await this.propertiesService.removeAllMedia(id);
            for (const file of files) {
                const { url } = await this.mediaService.uploadFile(file);
                await this.propertiesService.addMedia(id, url);
            }
        }
        
        return updatedProperty;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('REALTOR', 'ADMIN')
    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Request() req: any
    ) {
        return this.propertiesService.remove(id, req.user.id, req.user.role);
    }

    // ── Admin moderation ────────────────────────────────────────────

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/all')
    findAllAdmin() {
        return this.propertiesService.findAllAdmin();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: PropertyStatus,
    ) {
        return this.propertiesService.updateStatus(id, status);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch(':id/verify')
    updateVerification(
        @Param('id') id: string,
        @Body('verificationStatus') verificationStatus: VerificationStatus,
    ) {
        return this.propertiesService.updateVerification(id, verificationStatus);
    }
}
