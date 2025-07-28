"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  Globe,
  Zap,
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Save,
} from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function AnalyzerPage() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch("https://danilompg.app.n8n.cloud/webhook/SaasAnalyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          userId: "current-user-id", // This should come from auth context
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        setError("Erro ao analisar website. Tente novamente.")
      }
    } catch (error) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveAnalysis = async () => {
    try {
      const response = await fetch("/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: url,
          results,
        }),
      })

      if (response.ok) {
        // Show success message
        console.log("Análise salva com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao salvar análise:", error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#10b981]"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-[#10b981]/10"
    if (score >= 60) return "bg-yellow-50"
    return "bg-red-50"
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
      {/* Analyzer Form */}
      <motion.div variants={fadeInUp}>
        <Card className="p-8 border-0 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Analisador de Websites</h2>
            <p className="text-gray-600 text-lg">Insira a URL do website que deseja analisar</p>
          </div>

          <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://exemplo.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="h-14 text-lg"
                />
              </div>
              <Button type="submit" disabled={isAnalyzing} className="h-14 px-8 bg-[#10b981] hover:bg-[#059669]">
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analisando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Analisar Website</span>
                  </div>
                )}
              </Button>
            </div>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"
            >
              {error}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
          {/* Header with Save Button */}
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Resultados da Análise</h3>
              <p className="text-gray-600">{url}</p>
            </div>
            <Button onClick={handleSaveAnalysis} className="bg-[#10b981] hover:bg-[#059669]">
              <Save className="w-4 h-4 mr-2" />
              Salvar Análise
            </Button>
          </motion.div>

          {/* Score Cards */}
          <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "SEO Score",
                score: results.seoScore || 75,
                icon: TrendingUp,
                description: "Otimização para motores de busca",
              },
              {
                title: "Performance",
                score: results.performanceScore || 82,
                icon: BarChart3,
                description: "Velocidade e otimização",
              },
              {
                title: "Automação",
                score: results.automationScore || 60,
                icon: Zap,
                description: "Potencial de automação",
              },
              {
                title: "Usabilidade",
                score: results.usabilityScore || 88,
                icon: Globe,
                description: "Experiência do utilizador",
              },
            ].map((metric, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${getScoreBg(metric.score)}`}>
                      <metric.icon className={`w-5 h-5 ${getScoreColor(metric.score)}`} />
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>{metric.score}%</div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{metric.title}</h4>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Results */}
          <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-6">
            {/* SEO Analysis */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#10b981]" />
                  <h4 className="text-lg font-semibold text-gray-900">Análise SEO</h4>
                </div>

                <div className="space-y-3">
                  {[
                    { item: "Meta Title", status: "good", note: "Otimizado" },
                    { item: "Meta Description", status: "warning", note: "Muito longa" },
                    { item: "Headings Structure", status: "good", note: "Bem estruturado" },
                    { item: "Headings Structure", status: "good", note: "Bem estruturado" },
                    { item: "Alt Text Images", status: "error", note: "Faltam alt texts" },
                    { item: "Internal Links", status: "warning", note: "Poucos links internos" },
                  ].map((seoItem, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700">{seoItem.item}</span>
                      <div className="flex items-center space-x-2">
                        {seoItem.status === "good" && <CheckCircle className="w-4 h-4 text-[#10b981]" />}
                        {seoItem.status === "warning" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        {seoItem.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <Badge
                          variant={seoItem.status === "good" ? "default" : "secondary"}
                          className={
                            seoItem.status === "good"
                              ? "bg-[#10b981] text-white"
                              : seoItem.status === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {seoItem.note}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Performance Analysis */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Performance</h4>
                </div>

                <div className="space-y-4">
                  {[
                    { metric: "First Contentful Paint", value: "1.2s", status: "good" },
                    { metric: "Largest Contentful Paint", value: "2.8s", status: "warning" },
                    { metric: "Cumulative Layout Shift", value: "0.05", status: "good" },
                    { metric: "Time to Interactive", value: "3.1s", status: "warning" },
                  ].map((perfItem, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{perfItem.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{perfItem.value}</span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            perfItem.status === "good" ? "bg-[#10b981]" : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Automation Suggestions */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Sugestões de Automação</h4>
                </div>

                <div className="space-y-3">
                  {[
                    "Implementar chatbot para atendimento automático",
                    "Configurar email marketing automatizado",
                    "Adicionar formulários de captura de leads",
                    "Integrar sistema de remarketing",
                    "Automatizar backup de conteúdo",
                  ].map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Integration Opportunities */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Integrações Recomendadas</h4>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Google Analytics 4", priority: "Alta", description: "Tracking avançado" },
                    { name: "Mailchimp", priority: "Média", description: "Email marketing" },
                    { name: "Hotjar", priority: "Média", description: "Análise de comportamento" },
                    { name: "Zapier", priority: "Alta", description: "Automação de workflows" },
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{integration.name}</div>
                        <div className="text-sm text-gray-600">{integration.description}</div>
                      </div>
                      <Badge
                        variant={integration.priority === "Alta" ? "default" : "secondary"}
                        className={integration.priority === "Alta" ? "bg-orange-600 text-white" : ""}
                      >
                        {integration.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
