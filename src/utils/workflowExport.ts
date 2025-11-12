import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { WorkflowTemplate } from '@/types/workflow';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'json' | 'link';
  quality?: number;
  includeMetrics?: boolean;
  includeDescription?: boolean;
}

export class WorkflowExporter {
  private static generateShareableId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static async exportToPNG(
    element: HTMLElement, 
    filename: string = 'workflow',
    options: ExportOptions = { format: 'png', quality: 1 }
  ): Promise<string> {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: options.quality || 1,
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      const dataUrl = canvas.toDataURL('image/png', options.quality || 1);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return dataUrl;
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      throw new Error('Failed to export workflow as PNG');
    }
  }

  static async exportToPDF(
    element: HTMLElement,
    template: WorkflowTemplate,
    filename: string = 'workflow',
    options: ExportOptions = { format: 'pdf', quality: 1, includeMetrics: true, includeDescription: true }
  ): Promise<string> {
    try {
      // Create PDF document
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(147, 51, 234);
      pdf.text(template.name, 20, 25);
      
      // Add description if requested
      if (options.includeDescription && template.description) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        const splitDescription = pdf.splitTextToSize(template.description, pageWidth - 40);
        pdf.text(splitDescription, 20, 35);
      }
      
      // Add metrics if requested
      if (options.includeMetrics) {
        const metricsY = options.includeDescription ? 55 : 40;
        
        pdf.setFontSize(14);
        pdf.setTextColor(50, 50, 50);
        pdf.text('Workflow Metrics:', 20, metricsY);
        
        pdf.setFontSize(10);
        pdf.text(`Automation Score: ${template.metrics.automationScore}%`, 20, metricsY + 10);
        pdf.text(`Time Savings: ${template.metrics.timeSavings}`, 20, metricsY + 20);
        pdf.text(`Cost Reduction: ${template.metrics.costReduction}`, 20, metricsY + 30);
        pdf.text(`ROI: ${template.roi}`, 20, metricsY + 40);
        pdf.text(`Complexity: ${template.complexity}`, 120, metricsY + 10);
        pdf.text(`Industry: ${template.industry}`, 120, metricsY + 20);
        pdf.text(`Estimated Time: ${template.estimatedTime}`, 120, metricsY + 30);
      }
      
      // Capture workflow diagram
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: options.quality || 0.8,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add workflow image
      const imageY = options.includeMetrics ? 110 : (options.includeDescription ? 70 : 50);
      pdf.addImage(imgData, 'PNG', 20, imageY, imgWidth, Math.min(imgHeight, pageHeight - imageY - 20));
      
      // Add features list on second page if there's content
      if (template.features.length > 0) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setTextColor(147, 51, 234);
        pdf.text('Key Features:', 20, 25);
        
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        template.features.forEach((feature, index) => {
          pdf.text(`• ${feature}`, 20, 40 + (index * 8));
        });
        
        // Add integrations
        if (template.integrations.length > 0) {
          pdf.setFontSize(16);
          pdf.setTextColor(147, 51, 234);
          pdf.text('Integrations:', 20, 40 + (template.features.length * 8) + 20);
          
          pdf.setFontSize(10);
          pdf.setTextColor(80, 80, 80);
          template.integrations.forEach((integration, index) => {
            pdf.text(`• ${integration.name} - ${integration.description}`, 20, 55 + (template.features.length * 8) + 20 + (index * 8));
          });
        }
      }
      
      // Save PDF
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.download = `${filename}.pdf`;
      link.href = pdfUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(pdfUrl);
      return pdfUrl;
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export workflow as PDF');
    }
  }

  static exportToJSON(
    template: WorkflowTemplate,
    filename: string = 'workflow'
  ): string {
    try {
      const jsonData = JSON.stringify(template, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${filename}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      return jsonData;
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export workflow as JSON');
    }
  }

  static generateShareableLink(template: WorkflowTemplate): string {
    try {
      const shareId = this.generateShareableId();
      
      // In a real app, you'd save this to a backend
      // For demo purposes, we'll use localStorage and base64 encoding
      const encodedTemplate = btoa(JSON.stringify(template));
      const shareData = {
        id: shareId,
        template: encodedTemplate,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      localStorage.setItem(`workflow_share_${shareId}`, JSON.stringify(shareData));
      
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/workflow-demo?share=${shareId}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Share URL copied to clipboard:', shareUrl);
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
      
      return shareUrl;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error('Failed to generate shareable link');
    }
  }

  static loadSharedWorkflow(shareId: string): WorkflowTemplate | null {
    try {
      const shareData = localStorage.getItem(`workflow_share_${shareId}`);
      if (!shareData) return null;
      
      const parsed = JSON.parse(shareData);
      
      // Check if expired
      if (new Date() > new Date(parsed.expiresAt)) {
        localStorage.removeItem(`workflow_share_${shareId}`);
        return null;
      }
      
      const template = JSON.parse(atob(parsed.template));
      return template;
    } catch (error) {
      console.error('Error loading shared workflow:', error);
      return null;
    }
  }

  static async exportWorkflow(
    element: HTMLElement,
    template: WorkflowTemplate,
    options: ExportOptions,
    filename?: string
  ): Promise<string> {
    const baseFilename = filename || `${template.name.replace(/\s+/g, '_').toLowerCase()}`;
    
    switch (options.format) {
      case 'png':
        return await this.exportToPNG(element, baseFilename, options);
      
      case 'pdf':
        return await this.exportToPDF(element, template, baseFilename, options);
      
      case 'json':
        return this.exportToJSON(template, baseFilename);
      
      case 'link':
        return this.generateShareableLink(template);
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
}