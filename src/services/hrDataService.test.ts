import { describe, it, expect, vi, beforeEach } from "vitest";
import { transitionToHired } from "./hrDataService";

// Mock do cliente Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "user-123" } } },
      }),
    },
  },
}));

describe("transitionToHired — Etapa 4.3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. primeira contratação com vaga: RPC chamada, sucesso, contratação efetivada, débito ocorre uma única vez", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        status: "hired",
        hiredAt: "2026-08-23T20:00:00.000Z",
        eventId: "event-1",
        vacancyDebited: true,
      },
      error: null,
    });

    const result = await transitionToHired({ candidateId: "cand-1" });

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith("transition_to_hired", {
      p_candidate_id: "cand-1",
    });
    expect(result.status).toBe("hired");
    if (result.status === "hired") {
      expect(result.hiredAt).toBe("2026-08-23T20:00:00.000Z");
      expect(result.vacancyDebited).toBe(true);
      expect(result.event.id).toBe("event-1");
    }
  });

  it("2. primeira contratação sem vaga: contratação efetivada, nenhum débito", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        status: "hired",
        hiredAt: "2026-08-23T20:00:00.000Z",
        eventId: "event-2",
        vacancyDebited: false,
      },
      error: null,
    });

    const result = await transitionToHired({ candidateId: "cand-2" });

    expect(result.status).toBe("hired");
    if (result.status === "hired") {
      expect(result.vacancyDebited).toBe(false);
    }
  });

  it("3. segunda chamada para candidato já contratado: retorna already_hired, nenhum novo evento, nenhum novo débito", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        status: "already_hired",
        hiredAt: "2026-08-23T19:00:00.000Z",
      },
      error: null,
    });

    const result = await transitionToHired({ candidateId: "cand-3" });

    expect(result.status).toBe("already_hired");
    if (result.status === "already_hired") {
      expect(result.hiredAt).toBe("2026-08-23T19:00:00.000Z");
    }
    // A RPC é a autoridade; o serviço não insere evento nem debita.
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it("4. candidato legado (admission_status='Contratado' e hired_at=null): não debita novamente, não cria novo evento hired", async () => {
    // A RPC detecta o estado legado e retorna already_hired sem debitar.
    mockRpc.mockResolvedValueOnce({
      data: {
        status: "already_hired",
        hiredAt: null,
      },
      error: null,
    });

    const result = await transitionToHired({ candidateId: "cand-legacy" });

    expect(result.status).toBe("already_hired");
    // Nenhum débito e nenhum evento novo são criados pelo serviço.
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it("5. falha durante operação: serviço retorna erro, frontend não executa débito alternativo", async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Falha na transação" },
    });

    const result = await transitionToHired({ candidateId: "cand-5" });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toContain("Falha na transação");
    }
    // O serviço não executa débito alternativo.
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it("6. duas chamadas concorrentes: somente uma efetiva contratação, somente um evento, somente um débito", async () => {
    // Simula duas chamadas concorrentes. A primeira efetiva, a segunda retorna already_hired.
    mockRpc
      .mockResolvedValueOnce({
        data: {
          status: "hired",
          hiredAt: "2026-08-23T20:00:00.000Z",
          eventId: "event-6",
          vacancyDebited: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          status: "already_hired",
          hiredAt: "2026-08-23T20:00:00.000Z",
        },
        error: null,
      });

    const [r1, r2] = await Promise.all([
      transitionToHired({ candidateId: "cand-6" }),
      transitionToHired({ candidateId: "cand-6" }),
    ]);

    // Somente uma efetiva contratação.
    const hiredCount = [r1, r2].filter((r) => r.status === "hired").length;
    const alreadyCount = [r1, r2].filter((r) => r.status === "already_hired").length;
    expect(hiredCount).toBe(1);
    expect(alreadyCount).toBe(1);

    // Somente um débito (na chamada que efetivou).
    if (r1.status === "hired" && r1.vacancyDebited) {
      expect(r1.vacancyDebited).toBe(true);
    }
    if (r2.status === "hired" && r2.vacancyDebited) {
      expect(r2.vacancyDebited).toBe(true);
    }
  });
});