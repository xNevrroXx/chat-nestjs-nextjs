import { Test, TestingModule } from "@nestjs/testing";
import { RoomsOnFoldersController } from "./rooms-on-folders.controller";

describe("RoomsOnFoldersController", () => {
    let controller: RoomsOnFoldersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoomsOnFoldersController],
        }).compile();

        controller = module.get<RoomsOnFoldersController>(
            RoomsOnFoldersController
        );
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
