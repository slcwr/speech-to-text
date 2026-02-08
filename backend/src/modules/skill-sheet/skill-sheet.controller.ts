import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkillSheetService } from './skill-sheet.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class SkillSheetController {
  constructor(private skillSheetService: SkillSheetService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadSkillSheet(
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.id;
    let processFilePath = file.path;
    let processFileName = file.originalname;

    // Check if file is Excel format
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      try {
        // Convert Excel to CSV
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(file.path);
        const worksheet = workbook.worksheets[0];
        const rows: string[] = [];
        worksheet.eachRow((row) => {
          const values = (row.values as any[]).slice(1); // ExcelJS の row.values は 1-indexed（[0] は空）
          rows.push(values.map(v => v ?? '').join(','));
        });
        const csvData = rows.join('\n');

        // Save CSV file
        const csvFileName = file.filename.replace(/\.(xlsx|xls)$/i, '.csv');
        const csvPath = path.join(path.dirname(file.path), csvFileName);
        fs.writeFileSync(csvPath, csvData, 'utf-8');

        // Update file path and name for processing
        processFilePath = csvPath;
        processFileName = file.originalname.replace(/\.(xlsx|xls)$/i, '.csv');

        // Remove original Excel file
        fs.unlinkSync(file.path);
      } catch (error) {
        throw new BadRequestException(`Failed to convert Excel file: ${error.message}`);
      }
    }

    const skillSheet = await this.skillSheetService.uploadSkillSheet(
      userId,
      processFilePath,
      processFileName,
    );


    return {
      success: true,
      skillSheetId: skillSheet.id,
      fileName: file.originalname,
      message: 'Skill sheet uploaded successfully',
    };
  }

  @Post('reprocess/:id')
  async reprocessSkillSheet(
    @Request() req: any,
    @Param('id') skillSheetId: string,
  ) {
    const userId = req.user.id;
    
    // Verify ownership
    const skillSheet = await this.skillSheetService.getSkillSheetById(skillSheetId);
    if (skillSheet.user_id !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    // Find the associated session
    const session = await this.skillSheetService.getSessionBySkillSheetId(skillSheetId);
    if (!session) {
      throw new BadRequestException('No session found for this skill sheet');
    }

    // Reprocess the skill sheet
    await this.skillSheetService.processSkillSheet(skillSheetId, session.id);

    return {
      success: true,
      message: 'Skill sheet reprocessing started',
    };
  }
}