import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  let module: TestingModule;
  let prismaService: PrismaService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PrismaService', () => {
    expect(prismaService).toBeDefined();
    // Check that it has PrismaClient methods
    expect(typeof prismaService.$connect).toBe('function');
  });

  it('should export PrismaService globally', async () => {
    // Test that PrismaService can be accessed from a child module
    const childModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    const childPrismaService = childModule.get<PrismaService>(PrismaService);
    expect(childPrismaService).toBeDefined();

    await childPrismaService.$disconnect();
  });
});
