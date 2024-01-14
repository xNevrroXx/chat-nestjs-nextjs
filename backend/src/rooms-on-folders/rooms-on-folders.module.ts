import { Module } from "@nestjs/common";
import { RoomsOnFoldersService } from "./rooms-on-folders.service";
import { RoomsOnFoldersController } from "./rooms-on-folders.controller";

@Module({
    providers: [RoomsOnFoldersService],
    exports: [RoomsOnFoldersService],
    controllers: [RoomsOnFoldersController],
})
export class RoomsOnFoldersModule {}
