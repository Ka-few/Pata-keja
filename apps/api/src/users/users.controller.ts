import {
    Controller, Get, Patch, Delete, Param, Body, Request,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateProfileDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // ── Public ────────────────────────────────────────────────────────────────

    /** GET /users/agents — list all REALTORs */
    @Get('agents')
    findAllAgents() {
        return this.usersService.findAllAgents();
    }

    /** GET /users/agents/:id — single agent profile + listings */
    @Get('agents/:id')
    findOneAgent(@Param('id') id: string) {
        return this.usersService.findOneAgent(id);
    }

    // ── Authenticated (self) ───────────────────────────────────────────────────

    /** GET /users/me */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req: any) {
        return this.usersService.getMe(req.user.id);
    }

    /** PATCH /users/me */
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateMe(req.user.id, dto);
    }

    /** GET /users/me/properties — own listings (for agent dashboard) */
    @UseGuards(JwtAuthGuard)
    @Get('me/properties')
    getMyProperties(@Request() req: any) {
        return this.usersService.getMyProperties(req.user.id);
    }

    // ── Admin only ────────────────────────────────────────────────────────────

    /** GET /users — all users (admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get()
    findAllUsers() {
        return this.usersService.findAllUsers();
    }

    /** PATCH /users/agents/:id — update role/email/phone (admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('agents/:id')
    updateAgent(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateAgent(id, dto);
    }

    /** PATCH /users/agents/:id/ban — ban agent (admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('agents/:id/ban')
    @HttpCode(HttpStatus.OK)
    banAgent(@Param('id') id: string) {
        return this.usersService.banAgent(id);
    }

    /** PATCH /users/agents/:id/unban — unban agent (admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('agents/:id/unban')
    @HttpCode(HttpStatus.OK)
    unbanAgent(@Param('id') id: string) {
        return this.usersService.unbanAgent(id);
    }

    /** DELETE /users/agents/:id — delete agent + cascade (admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Delete('agents/:id')
    @HttpCode(HttpStatus.OK)
    deleteAgent(@Param('id') id: string) {
        return this.usersService.deleteAgent(id);
    }
}
