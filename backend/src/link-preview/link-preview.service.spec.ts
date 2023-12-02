import { Test, TestingModule } from "@nestjs/testing";
import { LinkPreviewService } from "./link-preview.service";

describe("LinkPreviewService", () => {
    let service: LinkPreviewService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LinkPreviewService],
        }).compile();

        service = module.get<LinkPreviewService>(LinkPreviewService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
