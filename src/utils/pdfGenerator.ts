import { jsPDF } from 'jspdf';
import { StockMovement, InventoryAudit, PurchaseSuggestion } from '../types';
import { storageService } from '../services/storageService';

export function generateMovementPdf(movement: StockMovement) {
  const doc = new jsPDF();
  const profile = storageService.getCompanyProfile();

  const isBR = movement.type === 'ENTREE_BR';
  const title = isBR ? 'BON DE RÉCEPTION (BR)' : 'BON DE LIVRAISON (BL)';
  const partyHeader = isBR ? 'Fournisseur / Expéditeur :' : 'Client / Acheteur :';

  // Top Dark Header Bar
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 32, 'F');
  
  // Custom Logo or Text
  if (profile.logoUrl && profile.logoUrl.startsWith('data:image')) {
    try {
      doc.addImage(profile.logoUrl, 'PNG', 14, 5, 22, 22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(profile.name.substring(0, 35), 40, 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(profile.tagline.substring(0, 50), 40, 22);
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(profile.name.substring(0, 35), 14, 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(profile.tagline.substring(0, 50), 14, 22);
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(profile.name.substring(0, 35), 14, 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(profile.tagline.substring(0, 50), 14, 22);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Blue-500
  doc.text(title, 140, 18);

  // Sub-header with Company Identifiers
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.address}, ${profile.city} | Tél: ${profile.phone} | Email: ${profile.email}`, 14, 38);
  doc.text(`ICE: ${profile.ice} | IF: ${profile.ifNumber} | RC: ${profile.rcNumber} | Patente: ${profile.patente}`, 14, 43);

  doc.line(14, 46, 196, 46);

  // Document Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Référence Document : ${movement.reference}`, 14, 54);
  doc.text(`Date de Mouvement : ${movement.date}`, 14, 60);
  doc.text(`Statut Validation : ${movement.status}`, 14, 66);

  doc.text(partyHeader, 120, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(movement.partyName, 120, 60);

  // Table Header
  let y = 74;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RÉF / SKU', 18, y + 6);
  doc.text('DÉSIGNATION', 55, y + 6);
  doc.text('QTÉ', 135, y + 6);
  doc.text('P.U HT (DH)', 150, y + 6);
  doc.text('TOTAL HT', 178, y + 6);

  y += 12;
  doc.setFont('helvetica', 'normal');
  let totalDocHT = 0;

  movement.items.forEach(item => {
    const totalLine = item.quantity * item.unitPriceHT;
    totalDocHT += totalLine;

    doc.text(item.productSku.substring(0, 18), 18, y);
    doc.text(item.productDesignation.substring(0, 38), 55, y);
    doc.text(String(item.quantity), 137, y);
    doc.text(item.unitPriceHT.toLocaleString('fr-FR') + ' DH', 150, y);
    doc.text(totalLine.toLocaleString('fr-FR') + ' DH', 178, y);

    // If S/N associated
    if (item.serialNumbers && item.serialNumbers.length > 0) {
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`  S/N Expédiés/Reçus: ${item.serialNumbers.join(', ')}`, 55, y);
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
    }

    // If Lot associated
    if (item.lotNumber) {
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`  N° Lot: ${item.lotNumber}`, 55, y);
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
    }

    y += 8;
  });

  // Total Summary
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total HT : ${totalDocHT.toLocaleString('fr-FR')} DH`, 140, y);
  doc.text(`Total TVA (20%) : ${(totalDocHT * 0.2).toLocaleString('fr-FR')} DH`, 140, y + 6);
  doc.text(`Total TTC : ${(totalDocHT * 1.2).toLocaleString('fr-FR')} DH`, 140, y + 12);

  if (movement.varianceNotes) {
    y += 20;
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text(`Remarques / Écarts : ${movement.varianceNotes}`, 14, y);
  }

  // Footer Signatures
  y = 230;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Signature & Cachet (${profile.name.substring(0, 25)}) :`, 14, y);
  doc.text(`Signature ${isBR ? 'Livreur / Transporteur' : 'Client / Réceptionnaire'} :`, 120, y);

  // Legal Document Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(profile.documentFooterNote, 14, 275, { maxWidth: 182 });
  doc.text(`${profile.name} - ${profile.address}, ${profile.city} - ICE: ${profile.ice} - RC: ${profile.rcNumber} - Capital: ${profile.capital}`, 14, 285);

  doc.save(`${movement.reference}_${movement.date}.pdf`);
}

export function generateInventoryPdf(audit: InventoryAudit) {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RAPPORT DE RAPPROCHEMENT D\'INVENTAIRE', 14, 18);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Réf : ${audit.reference} | Date : ${audit.date}`, 14, 38);
  doc.text(`Intitulé : ${audit.title}`, 14, 44);
  doc.text(`Auditeur : ${audit.auditorName}`, 14, 50);

  let y = 60;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ARTICLE', 18, y + 6);
  doc.text('STOCK THÉORIQUE', 90, y + 6);
  doc.text('STOCK PHYSIQUE', 125, y + 6);
  doc.text('ÉCART', 160, y + 6);
  doc.text('JUSTIFICATION', 178, y + 6);

  y += 12;
  doc.setFont('helvetica', 'normal');

  audit.items.forEach(item => {
    doc.text(item.productDesignation.substring(0, 35), 18, y);
    doc.text(String(item.theoreticalStock), 100, y);
    doc.text(String(item.physicalStock), 135, y);

    if (item.difference < 0) doc.setTextColor(220, 38, 38); // Red for deficit
    else if (item.difference > 0) doc.setTextColor(16, 185, 129); // Green for surplus
    else doc.setTextColor(30, 41, 59);

    doc.text((item.difference > 0 ? '+' : '') + item.difference, 162, y);
    doc.setTextColor(30, 41, 59);

    doc.text(item.justification || '-', 178, y);

    y += 8;
  });

  doc.save(`${audit.reference}_Rapprochement.pdf`);
}

export function generatePurchaseSuggestionsPdf(suggestions: PurchaseSuggestion[]) {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TABLEAU DE BORD D\'ACHAT - SUGGESTIONS DE RÉAPPROVISIONNEMENT', 14, 18);

  let y = 38;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Articles en rupture ou sous le seuil critique (${suggestions.length} références)`, 14, y);

  y += 8;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');

  doc.text('FOURNISSEUR', 18, y + 6);
  doc.text('ARTICLE / SKU', 60, y + 6);
  doc.text('STOCK / SEUIL', 120, y + 6);
  doc.text('CMD SUGGÉRÉE', 155, y + 6);
  doc.text('TOTAL EST. HT', 180, y + 6);

  y += 12;
  doc.setFont('helvetica', 'normal');
  let grandTotalHT = 0;

  suggestions.forEach(s => {
    grandTotalHT += s.estimatedTotalHT;

    doc.text(s.preferredSupplier.substring(0, 20), 18, y);
    doc.text(s.sku + ' - ' + s.designation.substring(0, 25), 60, y);
    doc.text(`${s.currentStock} / ${s.minStockThreshold}`, 122, y);
    doc.text(String(s.suggestedReorderQuantity), 162, y);
    doc.text(s.estimatedTotalHT.toLocaleString('fr-FR') + ' DH', 180, y);

    y += 8;
  });

  doc.line(14, y, 196, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`Montant Total Estimé Réapprovisionnement HT : ${grandTotalHT.toLocaleString('fr-FR')} DH`, 90, y);

  doc.save(`Suggestions_Commande_Achats_${new Date().toISOString().split('T')[0]}.pdf`);
}
