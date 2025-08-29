'use client'

import { useAuth } from '@/hooks/use-auth'
import { NewsList } from '@/components/news/news-list'
import { NewsForm } from '@/components/news/news-form'

export default function NewsPage() {
    const { isAdmin } = useAuth()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Noticias</h1>
                    <p className="text-gray-600">
                        Mantente al día con las últimas novedades de la franquicia
                    </p>
                </div>
                {isAdmin && <NewsForm />}
            </div>

            <NewsList />
        </div>
    )
}