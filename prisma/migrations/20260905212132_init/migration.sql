-- CreateTable
CREATE TABLE "TipoCambio" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fuente" TEXT NOT NULL DEFAULT 'BCB',
    "vigencia" TEXT,

    CONSTRAINT "TipoCambio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TipoCambio_fecha_idx" ON "TipoCambio"("fecha");
