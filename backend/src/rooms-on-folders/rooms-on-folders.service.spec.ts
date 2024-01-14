import { Test, TestingModule } from "@nestjs/testing";
import { RoomsOnFoldersService } from "./rooms-on-folders.service";

describe("RoomsOnFoldersService", () => {
    let service: RoomsOnFoldersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RoomsOnFoldersService],
        }).compile();

        service = module.get<RoomsOnFoldersService>(RoomsOnFoldersService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
