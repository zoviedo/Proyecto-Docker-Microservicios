"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, Square, RotateCw, Trash2, Server, ExternalLink, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Microservice {
  id: string
  name: string
  language: "python"
  status: "running" | "stopped" | "exited" | "error"
  endpoint: string
  createdAt: string
}

interface MicroservicesListProps {
  refreshTrigger?: number
  onEdit?: (id: string) => void
}

export function MicroservicesList({ refreshTrigger, onEdit }: MicroservicesListProps) {
  const [microservices, setMicroservices] = useState<Microservice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const fetchMicroservices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${backendUrl}/microservices`)
      if (!response.ok) throw new Error("Error al cargar microservicios")
      const data = await response.json()
      setMicroservices(data)
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los microservicios", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMicroservices()
  }, [refreshTrigger])

  const handleAction = async (id: string, action: "restart" | "stop" | "delete") => {
    setActionLoading(id)
    try {
      let response
      if (action === "delete") {
        response = await fetch(`${backendUrl}/microservices/${id}`, { method: "DELETE" })
      } else {
        response = await fetch(`${backendUrl}/microservices/${id}/${action}`, { method: "POST" })
      }

      if (!response.ok) throw new Error(`Error al ${action} el microservicio`)
      
      toast({ title: "Acción completada", description: `Acción '${action}' enviada.` })

      setTimeout(() => {
        fetchMicroservices()
        setActionLoading(null)
      }, 1500);
    } catch (error) {
      toast({ title: "Error en la acción", description: error instanceof Error ? error.message : "Error desconocido", variant: "destructive" })
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />Microservicios Activos</CardTitle>
        <CardDescription>Gestiona tus microservicios desplegados</CardDescription>
      </CardHeader>
      <CardContent>
        {microservices.length === 0 ? (
          <Alert><AlertDescription>No hay microservicios desplegados. Ve a la pestaña Editor para crear uno.</AlertDescription></Alert>
        ) : (
          <div className="space-y-4">
            {microservices.map((ms) => (
              <Card key={ms.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{ms.name}</h3>
                        <Badge variant={ ms.status === "running" ? "default" : (ms.status === "stopped" || ms.status === "exited") ? "secondary" : "destructive" }>
                          {ms.status}
                        </Badge>
                        <Badge variant="outline">{ms.language}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium">Endpoint:</span> <code className="text-xs">{ms.endpoint}</code></p>
                        <p><span className="font-medium">Creado:</span> {new Date(ms.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit?.(ms.id)}
                        title="Editar microservicio"
                        disabled={actionLoading === ms.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {(ms.status === "stopped" || ms.status === "exited") && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAction(ms.id, "restart")}
                          disabled={actionLoading === ms.id}
                        >
                          {actionLoading === ms.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {ms.status === "running" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAction(ms.id, "restart")}
                            disabled={actionLoading === ms.id}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAction(ms.id, "stop")}
                            disabled={actionLoading === ms.id}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleAction(ms.id, "delete")}
                        disabled={actionLoading === ms.id}
                      >
                        {actionLoading === ms.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}